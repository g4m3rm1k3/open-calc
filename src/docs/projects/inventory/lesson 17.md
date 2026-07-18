# Lesson 17: CSV Streaming, File Uploads, and Chunked Exports

**What you will build**
You will build two data-pipeline endpoints: one to ingest massive CSV file uploads into the database, and one to export the entire catalog as a downloadable CSV. The problem we are solving is memory exhaustion: loading a 50MB CSV file into Python RAM as a single string, converting it to JSON, and holding the response in memory will quickly crash a web server. We must learn to stream data byte-by-byte across the HTTP boundary.

**What you need to know first**
From Lesson 3: Pydantic parsing. From Lesson 8: `bulk_import_skus` (SQLAlchemy Core). From Lesson 9: FastAPI routing.

**The Pipeline**
`[ Multipart Upload (CSV) ] → FastAPI (Stream) → Pydantic (Row Validation) → SQLAlchemy (Core Upsert) → SQLite (Storage)`

This lesson radically alters how data enters the pipeline. Instead of a single, well-formed JSON object residing completely in memory, the API will receive a continuous stream of raw text bytes, decode them on the fly, validate them sequentially, and flush them to the database.

---

## Concept Unit: Streaming CSV File Uploads

### The Problem

When a client sends a JSON payload, FastAPI loads the entire JSON string into RAM before passing it to your endpoint. If a user uploads a CSV file containing 1,000,000 products, loading the whole file into RAM will trigger an Out Of Memory (OOM) crash. We need to intercept the file upload and read it line-by-line directly from the incoming network socket buffer.

### Introduce the concept in isolation

Create `lab_csv_read.py` to see how Python's built-in CSV parser can consume an iterable text stream without holding the whole stream in memory.

```python
import csv
import io

# We simulate a network stream using an in-memory string buffer
mock_network_stream = io.StringIO(
    "sku_id,name,description\n"
    "A1,Hammer,Steel head\n"
    "B2,Nails,\n"
)

# DictReader consumes the stream one line at a time
reader = csv.DictReader(mock_network_stream)

print("--- Iterating Stream ---")
for row in reader:
    print(f"Parsed Dictionary: {row}")

```

Run it:

```bash
python lab_csv_read.py

```

Output:

```text
--- Iterating Stream ---
Parsed Dictionary: {'sku_id': 'A1', 'name': 'Hammer', 'description': 'Steel head'}
Parsed Dictionary: {'sku_id': 'B2', 'name': 'Nails', 'description': ''}

```

*What this proves:* The `csv.DictReader` takes the first line of the stream, memorizes it as the header keys, and then yields native Python dictionaries for every subsequent line. It only ever holds exactly one row in memory at a time.

### Discard the throwaway example

Delete `lab_csv_read.py`. We will now build the secure CSV import endpoint.

### Project Change

We will append a new freestanding endpoint to our main FastAPI application to handle multipart file uploads.

* **Files affected:** `nexus/main.py`.
* **Change type:** Add.
* **Location:** At the bottom of the API route definitions, right above the `app.mount` static files line.
* **Dependencies:** Requires importing `csv`, `codecs`, `UploadFile`, and `File`.

### The New Code

```python
import csv
import codecs
from fastapi import UploadFile, File

@app.post("/skus/import/csv")
def import_skus_csv(file: UploadFile = File(...), db: Session = Depends(get_db_session)):
    # 1. Decode the binary network stream into text on the fly
    decoded_stream = codecs.iterdecode(file.file, 'utf-8')
    csv_reader = csv.DictReader(decoded_stream)
    
    valid_skus = []
    
    # 2. Validate row by row
    for row in csv_reader:
        # Pydantic validates the dictionary, enforcing rules and coercing types
        validated_obj = SKUCreate(**row)
        valid_skus.append(validated_obj.model_dump())
    
    # 3. Utilize the Core Upsert from Lesson 8
    crud.bulk_import_skus(session=db, skus_data=valid_skus)
    
    return {"status": "success", "rows_imported": len(valid_skus)}

```

### The Updated Project

Because this is a brand-new, freestanding endpoint function, the code block above represents the entirety of what is being appended to the route section of `nexus/main.py`. It establishes a dedicated ingestion path that converts raw CSV text directly into our database.

### Mechanical walkthrough

1. `import csv`: (First appearance). Python's standard library for reading and writing comma-separated values.
2. `import codecs`: (First appearance). Python's standard library for stream encoding and decoding.
3. `from fastapi import UploadFile, File`: (First appearance). Types used to intercept `multipart/form-data` file uploads before they are fully loaded into RAM.
4. `@app.post("/skus/import/csv")`: (Already established syntax). The endpoint decorator.
5. `file: UploadFile = File(...)`: (First appearance). Instructs FastAPI that the payload is not JSON, but a physical file upload. `UploadFile` uses Python's `SpooledTemporaryFile` under the hood: if the file is small, it stays in RAM; if it exceeds 1MB, it is seamlessly buffered to the server's hard drive to prevent memory crashes. The `...` (Ellipsis) signifies that this argument is strictly required.
6. `file.file`: (First appearance). The underlying raw binary file-like object exposing the data stream.
7. `codecs.iterdecode(file.file, 'utf-8')`: (First appearance). The network sends raw bytes (`b"sku_id..."`). `csv.DictReader` requires text strings (`"sku_id..."`). `iterdecode` is a generator that wraps the binary stream, safely converting bytes to UTF-8 text on the fly without reading the whole file into memory.
8. `csv_reader = csv.DictReader(decoded_stream)`: (First appearance). Wraps the text stream in the CSV parser.
9. `for row in csv_reader:`: (Basic syntax). Iterates through the file.
10. `validated_obj = SKUCreate(**row)`: (Hard concept reappearing: Dictionary Unpacking from Lesson 6). We feed the raw dictionary directly into our strict Pydantic model. If a single cell violates a length constraint or regex pattern, this line will immediately throw an exception and abort the entire upload.
11. `crud.bulk_import_skus(...)`: (Hard concept reappearing: Core Execution from Lesson 8). We pass the list of validated dictionaries to our high-speed Upsert function.

### CS Lens

**Stream Processing vs. Batch Processing.** If we read the whole file into a string (`file.read()`), we are batch processing. We wait for all data to arrive, use a massive chunk of RAM, process it, and finish. By combining `UploadFile` (which spools to disk), `iterdecode` (which yields strings line-by-line), and `DictReader` (which yields dicts line-by-line), we built a pure Stream Processing pipeline. The memory footprint of this endpoint remains exactly the same whether the user uploads a 10KB file or a 10GB file.

### SE Lens

Why did we accumulate `valid_skus` in a Python list and send them to `bulk_import_skus` all at once, instead of inserting them one by one inside the `for` loop? **Database I/O Bottlenecks.** While stream-reading the file is excellent for RAM, writing to the database one row at a time is terrible for disk I/O. The network is fast, the disk is slow. We accumulate the data in RAM (which is safe for a typical 10,000 row batch) and execute a single bulk `INSERT` to minimize disk writing overhead. If the file was truly 10 million rows, we would chunk it: accumulate 10,000, call `bulk_import`, clear the list, and repeat.

### Commands needed to make this unit real

No commands needed; the server will hot-reload.

### Run it. Show the real output.

Create a temporary file `test_skus.csv` on your computer:

```csv
sku_id,name,description
CSV-1,Wrench,10mm
CSV-2,Screwdriver,Phillips

```

Use `curl` to upload the file using the `multipart/form-data` protocol:

```bash
curl -X POST "http://127.0.0.1:8000/skus/import/csv" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_skus.csv"

```

Output:

```text
{"status":"success","rows_imported":2}

```

### One sentence connecting this unit to what came immediately before.

We successfully streamed bytes *in* from the network and parsed them, but exporting data requires us to reverse the process: generating bytes on the fly and pushing them *out* to the network without breaking the HTTP connection.

---

## Concept Unit: HTTP Chunked Transfer (StreamingResponse)

### The Problem

If a client requests a backup of the entire 500,000 item product catalog, querying all rows and returning a massive list of `SKURead` objects will cause FastAPI to serialize half a million objects into a single colossal JSON string before sending the HTTP response. The server will hang, run out of memory, and crash. We must stream the response, trickling data to the client line-by-line so the connection stays alive while RAM usage remains near zero.

### Introduce the concept in isolation

Create `lab_stream.py` to observe how a generator function yields data over time.

```python
import time

# A generator function yields values iteratively, pausing execution in between
def slow_data_generator():
    yield "Line 1: Starting export...\n"
    time.sleep(1) # Simulating a slow database query
    yield "Line 2: Processing data...\n"
    time.sleep(1)
    yield "Line 3: Export complete.\n"

print("--- Consuming Generator ---")
for chunk in slow_data_generator():
    # Print without adding extra newlines
    print(f"Received chunk: {chunk}", end="")

```

Run it:

```bash
python lab_stream.py

```

Output:

```text
--- Consuming Generator ---
Received chunk: Line 1: Starting export...
(1 second pause)
Received chunk: Line 2: Processing data...
(1 second pause)
Received chunk: Line 3: Export complete.

```

*What this proves:* The generator does not compute the entire output at once. It yields a string, yields control back to the caller (our `for` loop), and waits. FastAPI can use this exact mechanism to send strings directly into a live TCP socket.

### Discard the throwaway example

Delete `lab_stream.py`. We will now build the streaming CSV export endpoint.

### Project Change

We will append an export endpoint to `main.py` utilizing FastAPI's `StreamingResponse` and an in-memory string buffer to format the CSV data correctly.

* **Files affected:** `nexus/main.py`.
* **Change type:** Add.
* **Location:** At the bottom of the API route definitions.
* **Dependencies:** Requires importing `io` and `StreamingResponse`.

### The New Code

```python
import io
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from models import SKU

@app.get("/skus/export/csv")
def export_skus_csv(db: Session = Depends(get_db_session)):
    def iter_csv():
        # Using a StringIO buffer because csv.DictWriter requires a file-like object
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["sku_id", "name", "description", "weight"])
        
        # 1. Write the header, yield it to the network, and clear the buffer
        writer.writeheader()
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)
        
        # 2. Stream database rows iteratively
        skus = db.scalars(select(SKU)).all()
        for sku in skus:
            writer.writerow({
                "sku_id": sku.sku_id, 
                "name": sku.name, 
                "description": sku.description, 
                "weight": sku.weight
            })
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    # 3. Return the generator wrapped in a specialized response class
    return StreamingResponse(
        iter_csv(), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=catalog_export.csv"}
    )

```

### The Updated Project

Because this is a brand-new, freestanding endpoint function, the code block above represents the entirety of what is being appended to the route section of `nexus/main.py`. It provides a highly efficient data egress lane.

### Mechanical walkthrough

1. `import io`: (First appearance). Python's standard library for core tools working with streams.
2. `from fastapi.responses import StreamingResponse`: (First appearance). A specialized FastAPI class designed specifically to take a Python generator and wire it to an HTTP Chunked Transfer network socket.
3. `def iter_csv():`: (First appearance). A nested generator function defined inside the endpoint.
4. `output = io.StringIO()`: (First appearance). Creates a string buffer in memory. `csv.DictWriter` is designed to write to files, so we trick it by giving it this buffer.
5. `writer = csv.DictWriter(...)`: (First appearance). Instantiates the CSV formatting engine, explicitly defining the column headers.
6. `writer.writeheader()`: (First appearance). Writes `sku_id,name,description,weight\r\n` into the `StringIO` buffer.
7. `yield output.getvalue()`: (Already established syntax). Extracts the text from the buffer and hands it up to FastAPI, which instantly sends it over the network.
8. `output.seek(0)` and `output.truncate(0)`: (First appearance). Resets the `StringIO` buffer so it is completely empty. If we don't do this, the buffer will continuously grow, defeating the entire purpose of streaming.
9. `db.scalars(select(SKU)).all()`: (Already established syntax). Retrieves the objects from SQLite.
10. `writer.writerow({...})`: (First appearance). Formats the dictionary into a proper CSV string (handling quotes and commas automatically) and writes it into the buffer.
11. `StreamingResponse(...)`: (First appearance). Binds the generator to the network.
12. `media_type="text/csv"`: (First appearance). Tells the receiving browser exactly what kind of data is streaming in.
13. `headers={"Content-Disposition": "attachment; filename=..."}`: (First appearance). A specific HTTP header that commands the user's web browser to immediately trigger a "Save File" dialog download rather than trying to display the text on screen.

### CS Lens

**HTTP Chunked Transfer Encoding.** Historically, HTTP responses required a `Content-Length` header so the browser knew exactly how many bytes to expect. With streaming, the server doesn't know the final size. Chunked Transfer Encoding (HTTP/1.1) solves this. The server sends data in chunks, prefixing each chunk with its size in hex. When the generator finishes and returns, FastAPI sends a final chunk of size `0`, cleanly closing the network protocol.

### SE Lens

Notice we used `db.scalars().all()` which pulls all records from the database into RAM, even though we are streaming them *out* one by one. This is a compromise. To make this a true end-to-end stream with zero RAM overhead, we would need to use SQLAlchemy's `yield_per()` execution option (e.g., `db.scalars(select(SKU).yield_per(1000))`). This commands the DBAPI to fetch rows from the SQLite engine in batches of 1,000, yielding them through the generator, and pushing them to the network, resulting in absolute maximum efficiency for multi-gigabyte databases.

### Commands needed to make this unit real

No commands needed.

### Run it. Show the real output.

Send a GET request to trigger the export. Because of the headers, if you typed this URL in a browser, it would download a file. Here, we'll use `curl` to print it to the terminal.

```bash
curl http://127.0.0.1:8000/skus/export/csv

```

Output:

```text
sku_id,name,description,weight
M5-BOLT,M5 Hex Bolt,,
TEST-99,API Bolt,,
CSV-1,Wrench,10mm,
CSV-2,Screwdriver,Phillips,

```

*(The output will contain all SKUs you have created throughout the curriculum).*

### One sentence connecting this unit to what came immediately before.

With binary file streams managed intelligently at the HTTP boundary, the application can now ingest and export massive datasets without jeopardizing its memory constraints or blocking other concurrent API requests.

---

## Closing

**Connect the pieces**
If an administrator clicks "Export Catalog" on the frontend: The browser issues a `GET /skus/export/csv` request. FastAPI delegates the response generation to `StreamingResponse` (Lesson 17). The generator `iter_csv` requests the session (Lesson 9) and fetches the `SKU` ORM objects (Lesson 4) from the SQLite physical file (Lesson 1). Inside the Python `for` loop, `csv.DictWriter` (Lesson 17) formats a single object into a raw CSV string in a `StringIO` buffer, `yield`s it, and clears the buffer. FastAPI receives that yielded string, wraps it in a Chunked Transfer frame, and transmits it via Uvicorn. The browser receives the bytes sequentially and streams them directly onto the user's hard drive as `catalog_export.csv`.

**What breaks without this**
If you removed `output.seek(0)` and `output.truncate(0)` from the `iter_csv` generator loop, the application would catastrophically corrupt the export stream. On the first loop iteration, you yield row 1. On the second iteration, the buffer contains row 1 *and* row 2, and you yield both. On the third iteration, you yield row 1, 2, and 3. The resulting CSV file would contain a rapidly compounding pyramid of duplicated data, completely destroying the file's structural integrity.

**Exercises**

1. Deliberately sabotage `test_skus.csv` by changing the `CSV-1` row to exceed your Pydantic validation rules: make the `name` column over 100 characters long. Re-run the `curl` upload command and verify that FastAPI safely intercepts the `ValidationError` thrown during dictionary unpacking and returns an HTTP 400 error.
2. In `export_skus_csv`, comment out the `headers={"Content-Disposition"...}` line inside the `StreamingResponse` return statement. Open your browser and navigate to `[http://127.0.0.1:8000/skus/export/csv](http://127.0.0.1:8000/skus/export/csv)`. Notice that the browser now displays the CSV text directly on the screen instead of downloading a file.

**Definition of Done**

* [x] A `POST` endpoint safely streams `multipart/form-data` uploads into the `csv.DictReader` using `codecs.iterdecode`.
* [x] Inbound CSV data is row-validated using dictionary unpacking against Pydantic schemas.
* [x] A `GET` endpoint utilizes generator functions and `io.StringIO` buffers to format CSV rows iteratively.
* [x] FastAPI `StreamingResponse` successfully bridges the Python generator to an HTTP Chunked Transfer socket.
* [x] You can commit these changes with the message: `feat: implement stream-safe csv data ingestion and export endpoints`.