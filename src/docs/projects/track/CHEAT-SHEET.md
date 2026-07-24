# Pocket Inventory (Android) — Quick Reference

A scroll-through reference for code patterns taught across Lessons 1–34,
grouped by topic instead of lesson order so you can find "how do I do X"
without remembering which lesson taught it. Each entry links back to its
source lesson for the full explanation, labs, and reasoning — this doc is
deliberately just the pattern, not the teaching.

**Package name used throughout:** `com.yourname.pocketinventory` — swap
for your actual package.

---

## Project Setup & App Identity

### Package declaration must match folder location
A `package` line isn't a label — it's a compiler-checked claim about
where the file physically lives (`com/example/foo/` folder for
`package com.example.foo;`).
_Lesson 1_
```java
package com.yourname.pocketinventory;
```

### Manifest — declaring a launcher Activity
The only place that connects a class to "this is what opens when the
user taps the icon."
_Lesson 2_
```xml
<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

### Manifest — a non-launcher Activity (internal navigation only)
No `<intent-filter>`; `exported="false"` blocks other apps from
launching it directly.
_Lesson 4_
```xml
<activity android:name=".InventoryActivity" android:exported="false" />
```

### Adding a Gradle dependency
`app/build.gradle`, inside `dependencies { }`. Sync after every change.
_Lesson 6 (first appearance), reused constantly_
```gradle
implementation 'androidx.recyclerview:recyclerview:1.3.2'
```

---

## Activity & Fragment Lifecycle

### The onCreate / setContentView skeleton
Every Activity's minimum shape.
_Lesson 2_
```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

### Full lifecycle logging (diagnose "why did my screen restart")
Add these when you need to see the real order of onStart/onResume/
onPause/onStop/onDestroy for a bug.
_Lesson 5_
```java
@Override protected void onStart()  { super.onStart();  Log.d("Lifecycle", "onStart"); }
@Override protected void onResume() { super.onResume(); Log.d("Lifecycle", "onResume"); }
@Override protected void onPause()  { super.onPause();  Log.d("Lifecycle", "onPause"); }
@Override protected void onStop()   { super.onStop();   Log.d("Lifecycle", "onStop"); }
@Override protected void onDestroy(){ super.onDestroy();Log.d("Lifecycle", "onDestroy"); }
```

### Rescuing state across rotation (NOT process death — see SharedPreferences/Room for that)
Only for small, transient UI state. Save before destruction, restore in
`onCreate`.
_Lesson 5_
```java
@Override
protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putInt("tapCount", tapCount);
}

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    if (savedInstanceState != null) {
        tapCount = savedInstanceState.getInt("tapCount", 0);
    }
}
```

### Fragment skeleton — onCreateView / onViewCreated split
`onCreateView` only inflates and returns the view; wiring happens in
`onViewCreated`, guaranteed to run after the view exists.
_Lesson 18_
```java
public class InventoryListFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_inventory_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // findViewById, ViewModel setup, LiveData observation goes here
    }
}
```

### Why LiveData observation uses getViewLifecycleOwner(), not `this`, in a Fragment
A Fragment's own lifecycle and its View's lifecycle are different — use
the View's, or risk delivering to a destroyed view.
_Lesson 18_
```java
viewModel.getItems().observe(getViewLifecycleOwner(), items -> adapter.submitList(items));
```

### Hosting a Fragment manually (pre-Navigation-Component)
Guard with `savedInstanceState == null` or rotation duplicates the
Fragment on top of the one FragmentManager already restored.
_Lesson 18_
```java
if (savedInstanceState == null) {
    getSupportFragmentManager()
            .beginTransaction()
            .replace(R.id.fragmentContainer, new InventoryListFragment())
            .commit();
}
```

---

## Layouts (XML / Views)

### ConstraintLayout — anchoring to parent edges
No absolute x/y — every position is a relationship the layout engine
solves for.
_Lesson 3_
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    app:layout_constraintTop_toTopOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent" />
```

### dp / sp — density-independent sizing
`dp` for everything spatial; `sp` only for text (respects the user's
accessibility font-size setting).
_Lesson 3_
```xml
android:layout_marginTop="64dp"
android:textSize="28sp"
```

### A RecyclerView row layout
The template inflated once per visible row, never per data item.
_Lesson 6_
```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:padding="16dp">
    <TextView android:id="@+id/itemNameText" android:layout_width="match_parent" android:layout_height="wrap_content" android:textSize="18sp" />
    <TextView android:id="@+id/itemDetailText" android:layout_width="match_parent" android:layout_height="wrap_content" android:textSize="14sp" />
</LinearLayout>
```

---

## Navigation

### Explicit Intent — start an Activity you own
_Lesson 4_
```java
Intent intent = new Intent(this, InventoryActivity.class);
startActivity(intent);
```

### Passing a Parcelable object through an Intent
_Lesson 8_
```java
intent.putExtra("EXTRA_ITEM", item);
// receiving side:
Item item = getIntent().getParcelableExtra("EXTRA_ITEM");
```

### Making a class Parcelable (the boilerplate)
_Lesson 8_
```java
public class Item implements Parcelable {
    protected Item(Parcel in) {
        name = in.readString();
        quantity = in.readInt();
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(name);
        dest.writeInt(quantity);
    }

    @Override
    public int describeContents() { return 0; }

    public static final Parcelable.Creator<Item> CREATOR = new Parcelable.Creator<Item>() {
        @Override public Item createFromParcel(Parcel in) { return new Item(in); }
        @Override public Item[] newArray(int size) { return new Item[size]; }
    };
}
```

### Activity Result API — launching for a result
Replaces the deprecated `startActivityForResult`/`onActivityResult`.
_Lesson 10_
```java
private final ActivityResultLauncher<Intent> addItemLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
        Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
    }
});
// launch it:
addItemLauncher.launch(new Intent(this, AddItemActivity.class));
// on the sending screen, before finish():
setResult(RESULT_OK, resultIntent);
```

### Navigation Component — a graph destination with an argument
_Lesson 19_
```xml
<fragment
    android:id="@+id/itemDetailFragment"
    android:name="com.yourname.pocketinventory.ItemDetailFragment"
    android:label="Item Detail">
    <argument android:name="item" app:argType="com.yourname.pocketinventory.Item" />
</fragment>
```

### Navigation Component — navigating with Safe Args
Generated `Directions`/`Args` classes are compile-time checked, unlike
raw Intent extras.
_Lesson 19_
```java
InventoryListFragmentDirections.ActionListToDetail action =
        InventoryListFragmentDirections.actionListToDetail(item);
Navigation.findNavController(view).navigate(action);
// receiving side:
Item item = ItemDetailFragmentArgs.fromBundle(getArguments()).getItem();
```

### Implicit Intent — ask the OS for any app that can handle an action
Always check `resolveActivity` first; nothing guarantees a handler
exists.
_Lesson 25_
```java
Intent dialIntent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:5555555555"));
if (dialIntent.resolveActivity(getPackageManager()) != null) {
    startActivity(dialIntent);
}
```

---

## Data Modeling

### equals() / hashCode() — value equality, not reference equality
`==` on objects checks identity; override both together or not at all.
_Lesson 7_
```java
@Override
public boolean equals(Object other) {
    if (this == other) return true;
    if (!(other instanceof Item)) return false;
    Item that = (Item) other;
    return quantity == that.quantity && name.equals(that.name);
}

@Override
public int hashCode() {
    return Objects.hash(name, quantity);
}
```

---

## Lists — RecyclerView

### RecyclerView.Adapter skeleton
The three required overrides; `getItemCount()` is what RecyclerView
trusts to know how many rows exist.
_Lesson 6_
```java
public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    @NonNull @Override
    public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_inventory, parent, false);
        return new InventoryViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        Item item = items.get(position);
        holder.itemNameText.setText(item.getName());
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        TextView itemNameText;
        InventoryViewHolder(View itemView) {
            super(itemView);
            itemNameText = itemView.findViewById(R.id.itemNameText);
        }
    }
}
```

### Custom click-listener interface for a row tap
`getAdapterPosition()` read fresh at click time, since a recycled
holder's position can change while scrolling.
_Lesson 8_
```java
interface OnItemClickListener {
    void onItemClick(Item item);
}
// inside onCreateViewHolder:
itemView.setOnClickListener(v -> listener.onItemClick(items.get(holder.getAdapterPosition())));
```

### ListAdapter + DiffUtil — replaces manual notifyDataSetChanged()
Diffing runs off the main thread automatically; animates only the rows
that actually changed.
_Lesson 20_
```java
private static final DiffUtil.ItemCallback<Item> DIFF_CALLBACK = new DiffUtil.ItemCallback<Item>() {
    @Override public boolean areItemsTheSame(@NonNull Item a, @NonNull Item b) { return a.getId() == b.getId(); }
    @Override public boolean areContentsTheSame(@NonNull Item a, @NonNull Item b) { return a.equals(b); }
};

public class InventoryAdapter extends ListAdapter<Item, InventoryAdapter.InventoryViewHolder> {
    InventoryAdapter() { super(DIFF_CALLBACK); }
    // getItem(position) replaces items.get(position); no getItemCount()/items field needed
}
// updating the list:
adapter.submitList(updatedItems);
```

---

## Forms & Validation

### Reading EditText safely
`.getText()` returns an `Editable`, not a `String` — always
`.toString().trim()`.
_Lesson 9_
```java
String name = nameInput.getText().toString().trim();
```

### Fail-fast validation with inline errors
Reject at the first problem; `try/catch` is required around
`Integer.parseInt` since `inputType="number"` is only a keyboard hint,
not a guarantee.
_Lesson 9_
```java
if (name.isEmpty()) {
    nameInput.setError("Name is required");
    return;
}
int quantity;
try {
    quantity = Integer.parseInt(quantityText);
} catch (NumberFormatException e) {
    quantityInput.setError("Enter a whole number");
    return;
}
```

---

## Persistence

### SharedPreferences — small key-value settings
Survives app close/reopen; wrong tool for a whole list of records.
_Lesson 11_
```java
SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE);
prefs.edit().putInt("low_stock_threshold", 5).apply();
int threshold = prefs.getInt("low_stock_threshold", 5);
```

### Raw SQLite — SQLiteOpenHelper skeleton
The manual version Room replaces — parameterize everything, never
concatenate SQL strings.
_Lesson 12_
```java
public class DbHelper extends SQLiteOpenHelper {
    DbHelper(Context context) { super(context, "app.db", null, 1); }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, quantity INTEGER)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS items");
        onCreate(db);
    }
}
// insert:
ContentValues values = new ContentValues();
values.put("name", "Widget");
db.insert("items", null, values);
// query:
Cursor cursor = db.rawQuery("SELECT name, quantity FROM items", null);
while (cursor.moveToNext()) {
    String name = cursor.getString(0);
}
cursor.close();
```

### Room — Entity / Dao / Database skeleton
Same underlying SQLite, generated at compile time from annotations.
_Lesson 13_
```java
@Entity(tableName = "items")
public class Item {
    @PrimaryKey(autoGenerate = true) private long id;
    private String name;
    // getters/setters
}

@Dao
public interface ItemDao {
    @Insert long insert(Item item);
    @Update void update(Item item);
    @Delete void delete(Item item);
    @Query("SELECT * FROM items") List<Item> getAll();
}

@Database(entities = {Item.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();
    private static AppDatabase instance;
    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(context.getApplicationContext(), AppDatabase.class, "app.db").build();
        }
        return instance;
    }
}
```

### Room forbids main-thread queries — always wrap in a background executor
_Lesson 13_
```java
dbExecutor.execute(() -> {
    List<Item> loaded = itemDao.getAll();
    runOnUiThread(() -> {
        items.clear();
        items.addAll(loaded);
        adapter.notifyDataSetChanged();
    });
});
```

---

## Threading

### ExecutorService — the standard background-work pattern
Single-thread executor for DB work serializes writes and avoids races.
_Lesson 14_
```java
private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
dbExecutor.execute(() -> { /* background work */ });
```

### Crossing back to the main thread
Touching a View from a background thread throws
`CalledFromWrongThreadException` immediately, every time.
_Lesson 14_
```java
runOnUiThread(() -> { /* UI-touching code only */ });
```

---

## Architecture — ViewModel, LiveData, Repository

### ViewModel retrieval (survives rotation, not process death)
Constructing directly with `new` defeats it — must go through the
provider.
_Lesson 15_
```java
viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);
```

### AndroidViewModel skeleton
_Lesson 15_
```java
public class InventoryViewModel extends AndroidViewModel {
    public InventoryViewModel(@NonNull Application application) {
        super(application);
    }
}
```

### MutableLiveData — exposed as read-only LiveData
Field stays `MutableLiveData` internally; only the narrower `LiveData`
type is exposed so outside code can't call `setValue`.
_Lesson 16_
```java
private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(new ArrayList<>());
LiveData<List<Item>> getItems() { return itemsLiveData; }
// from a background thread:
itemsLiveData.postValue(updatedList);
```

### Observing LiveData
_Lesson 16_
```java
viewModel.getItems().observe(getViewLifecycleOwner(), items -> adapter.submitList(items));
```

### Repository — the layer between ViewModel and Dao
ViewModel never imports `ItemDao`/`AppDatabase` directly; only the
Repository does.
_Lesson 17_
```java
public class ItemRepository {
    private final ItemDao itemDao;
    ItemRepository(Application application) {
        itemDao = AppDatabase.getInstance(application).itemDao();
    }
    LiveData<List<Item>> getItems() { /* ... */ }
    void loadItems() { /* ... */ }
}
```

---

## UI Chrome

### Toolbar wired to Navigation Component
_Lesson 21_
```java
MaterialToolbar toolbar = findViewById(R.id.toolbar);
setSupportActionBar(toolbar);
NavController navController = ((NavHostFragment) getSupportFragmentManager()
        .findFragmentById(R.id.navHostFragment)).getNavController();
NavigationUI.setupActionBarWithNavController(this, navController);
```

### Options menu via MenuProvider (modern, replaces onCreateOptionsMenu)
Scoped to `getViewLifecycleOwner()` so it stops contributing once the
Fragment's view is gone.
_Lesson 21_
```java
requireActivity().addMenuProvider(new MenuProvider() {
    @Override
    public void onCreateMenu(@NonNull Menu menu, @NonNull MenuInflater inflater) {
        inflater.inflate(R.menu.menu_inventory_list, menu);
    }
    @Override
    public boolean onMenuItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.menu_settings) { /* handle */ return true; }
        return false;
    }
}, getViewLifecycleOwner());
```

### AlertDialog — confirm before a destructive action
Only wire the real action inside the positive button's lambda — never
call it directly from the menu/click handler.
_Lesson 22_
```java
new AlertDialog.Builder(requireContext())
        .setTitle("Delete " + item.getName() + "?")
        .setMessage("This cannot be undone.")
        .setPositiveButton("Delete", (dialog, which) -> viewModel.deleteItem(item))
        .setNegativeButton("Cancel", null)
        .show();
```

### Snackbar with an Undo action
_Lesson 23_
```java
Snackbar.make(requireView(), "Deleted " + item.getName(), Snackbar.LENGTH_LONG)
        .setAction("Undo", v -> viewModel.addItem(restoredItem))
        .show();
```

### ItemTouchHelper — swipe-to-delete skeleton
_Lesson 23_
```java
ItemTouchHelper touchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(
        0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {
    @Override
    public boolean onMove(@NonNull RecyclerView rv, @NonNull RecyclerView.ViewHolder vh, @NonNull RecyclerView.ViewHolder target) {
        return false;
    }
    @Override
    public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
        int position = viewHolder.getAdapterPosition();
        // remove item at position
    }
});
touchHelper.attachToRecyclerView(recyclerView);
```

---

## Permissions

### The three-way runtime permission check
Always branch: already granted / show rationale first / request fresh.
_Lesson 24_
```java
boolean granted = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        == PackageManager.PERMISSION_GRANTED;
if (granted) {
    // proceed
} else if (shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)) {
    // show an explanation dialog first, then launch the request
} else {
    permissionLauncher.launch(Manifest.permission.CAMERA);
}
```

### Requesting a permission via the Activity Result API
_Lesson 24_
```java
private final ActivityResultLauncher<String> permissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
    // handle granted (boolean)
});
```

---

## Background Work & Notifications

### WorkManager — a periodic background job
`ExistingPeriodicWorkPolicy.KEEP` prevents duplicate scheduling on every
app launch.
_Lesson 26_
```java
public class LowStockWorker extends Worker {
    public LowStockWorker(@NonNull Context context, @NonNull WorkerParameters params) { super(context, params); }
    @NonNull @Override
    public Result doWork() {
        // real work here, already off the main thread
        return Result.success();
    }
}
// scheduling:
PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(LowStockWorker.class, 6, TimeUnit.HOURS).build();
WorkManager.getInstance(context).enqueueUniquePeriodicWork("low_stock_check", ExistingPeriodicWorkPolicy.KEEP, request);
```

### Posting a notification
Requires a channel created once (in `Application.onCreate()`) and, on
Android 13+, the `POST_NOTIFICATIONS` runtime permission.
_Lesson 26_
```java
NotificationChannel channel = new NotificationChannel("low_stock_channel", "Low Stock Alerts", NotificationManager.IMPORTANCE_DEFAULT);
getSystemService(NotificationManager.class).createNotificationChannel(channel);

NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "low_stock_channel")
        .setSmallIcon(android.R.drawable.ic_dialog_alert)
        .setContentTitle("Low Stock Alert")
        .setContentText("3 items at or below threshold")
        .setAutoCancel(true);
NotificationManagerCompat.from(context).notify(1001, builder.build());
```

### BroadcastReceiver — Manifest-declared (only works for exempted actions like BOOT_COMPLETED)
_Lesson 27_
```java
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // reschedule WorkManager jobs defensively
        }
    }
}
```
```xml
<receiver android:name=".BootReceiver" android:exported="true">
    <intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter>
</receiver>
```

### BroadcastReceiver — dynamically registered (required for most implicit broadcasts on modern Android)
_Lesson 27_
```java
IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
registerReceiver(myReceiver, filter);
```

---

## Networking

### Retrofit — declaring an API as an interface
_Lesson 28_
```java
public interface CatalogApi {
    @GET("posts")
    Call<List<RemoteNotice>> getNotices();
}
```

### Retrofit — building the client
_Lesson 28_
```java
CatalogApi api = new Retrofit.Builder()
        .baseUrl("https://example.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(CatalogApi.class);
```

### Retrofit — async call with success/failure handling
Runs on Retrofit's own thread pool; no manual ExecutorService needed.
_Lesson 28_
```java
api.getNotices().enqueue(new Callback<List<RemoteNotice>>() {
    @Override
    public void onResponse(Call<List<RemoteNotice>> call, Response<List<RemoteNotice>> response) {
        if (response.isSuccessful() && response.body() != null) { /* use response.body() */ }
    }
    @Override
    public void onFailure(Call<List<RemoteNotice>> call, Throwable t) { /* no connection, timeout, etc. */ }
});
```

---

## Sharing Data — ContentProvider

### UriMatcher — routing requests by URI shape
_Lesson 29_
```java
private static final UriMatcher uriMatcher = new UriMatcher(UriMatcher.NO_MATCH);
static {
    uriMatcher.addURI(AUTHORITY, "items", ITEMS);
    uriMatcher.addURI(AUTHORITY, "items/#", ITEM_ID);
}
```

### ContentProvider query() returning a MatrixCursor
Bridges typed Room objects back down to the raw Cursor contract.
_Lesson 29_
```java
MatrixCursor cursor = new MatrixCursor(new String[]{"id", "name", "quantity"});
for (Item item : items) {
    cursor.addRow(new Object[]{item.getId(), item.getName(), item.getQuantity()});
}
return cursor;
```

---

## Testing

### JUnit — a basic test
_Lesson 30_
```java
public class ItemTest {
    @Test
    public void equals_returnsTrueForSameFieldValues() {
        assertEquals(new Item("Rags", 12), new Item("Rags", 12));
    }
}
```

### Mockito — mocking a dependency, verifying a call
Requires a constructor that accepts the dependency directly
(dependency injection) — refactor if the class only builds it
internally.
_Lesson 30_
```java
ItemDao fakeDao = mock(ItemDao.class);
when(fakeDao.getAll()).thenReturn(fakeItems);
ItemRepository repository = new ItemRepository(fakeDao);
repository.loadItems();
verify(fakeDao, times(1)).getAll();
```

### Espresso — instrumented UI test skeleton
Runs on a real device/emulator, not a plain JVM.
_Lesson 31_
```java
@RunWith(AndroidJUnit4.class)
public class InventoryFlowTest {
    @Test
    public void addingItem_appearsInList() {
        try (ActivityScenario<InventoryActivity> scenario = ActivityScenario.launch(InventoryActivity.class)) {
            onView(withId(R.id.addItemFab)).perform(click());
            onView(withId(R.id.nameInput)).perform(typeText("Test Widget"), closeSoftKeyboard());
            onView(withId(R.id.saveButton)).perform(click());
            onView(withId(R.id.inventoryRecyclerView)).check(matches(hasDescendant(withText("Test Widget"))));
        }
    }
}
```

---

## Jetpack Compose (Kotlin — everything else in this project is Java)

### A basic @Composable function
_Lesson 32_
```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}
```

### State that survives recomposition
`remember` keeps the same holder across reruns; without it, state
resets on every recomposition.
_Lesson 32_
```kotlin
var thresholdText by remember { mutableStateOf("5") }
TextField(value = thresholdText, onValueChange = { thresholdText = it })
```

### Hosting Compose content from Java (ComposeView)
_Lesson 32_
```java
ComposeView composeView = new ComposeView(requireContext());
composeView.setContent(compose -> {
    ComposeSettingsScreenKt.ComposeSettingsScreen(requireContext(), () -> Unit.INSTANCE);
    return Unit.INSTANCE;
});
```

---

## Theming & Resources

### Resource qualifiers — dark mode
Same resource names, different folder — resolved automatically by the
OS, no Java branching.
_Lesson 33_
```
res/values/colors.xml         (light — default)
res/values-night/colors.xml   (dark — same <color name="..."> keys, different hex values)
```

### Resource qualifiers — tablet layout
_Lesson 33_
```
res/layout/activity_inventory.xml          (phone)
res/layout-sw600dp/activity_inventory.xml  (tablet — smallest-width ≥ 600dp)
```
```java
// detect which one is active at runtime:
View detailContainer = findViewById(R.id.detailContainer);
if (detailContainer != null) { /* two-pane layout is active */ }
```

### <style> — a reusable attribute bundle
_Lesson 33_
```xml
<style name="PrimaryActionButton" parent="Widget.MaterialComponents.Button">
    <item name="android:minWidth">200dp</item>
</style>
```
```xml
<Button style="@style/PrimaryActionButton" ... />
```

---

## Build & Release

### Gradle release signing config
Credentials loaded from a gitignored `keystore.properties`, never
committed.
_Lesson 34_
```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### ProGuard/R8 — keep a reflection-accessed class
Needed for classes Room/Gson read by field name rather than direct
method calls.
_Lesson 34_
```proguard
-keep class com.yourname.pocketinventory.Item { *; }
```

---

## Index by Lesson

| # | Topic | # | Topic |
|---|---|---|---|
| 1 | Package/folder structure | 18 | Fragments |
| 2 | Manifest, Activity lifecycle, R class | 19 | Navigation Component |
| 3 | ConstraintLayout, dp/sp | 20 | DiffUtil / ListAdapter |
| 4 | Intents, second Activity | 21 | Toolbar, menus, search |
| 5 | Full lifecycle, rotation, onSaveInstanceState | 22 | Dialogs |
| 6 | RecyclerView, Adapter, ViewHolder | 23 | Swipe-to-delete, Snackbar |
| 7 | Item model, equals/hashCode | 24 | Runtime permissions |
| 8 | Intent extras, Parcelable | 25 | Implicit Intents, camera |
| 9 | EditText, validation | 26 | Services, WorkManager, notifications |
| 10 | Activity Result API | 27 | BroadcastReceivers |
| 11 | SharedPreferences | 28 | Retrofit, JSON |
| 12 | Raw SQLite | 29 | ContentProvider |
| 13 | Room | 30 | JUnit, Mockito |
| 14 | Threading, ANRs | 31 | Espresso |
| 15 | ViewModel | 32 | Jetpack Compose |
| 16 | LiveData | 33 | Theming, dark mode, tablet layout |
| 17 | Repository pattern | 34 | Signing, R8, release build |
