const check = async (url) => {
  try {
    const resObj = await fetch(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } });
    console.log(url);
    console.log("Status:", resObj.status);
    console.log("X-Frame-Options:", resObj.headers.get("x-frame-options"));
    console.log("CSP:", resObj.headers.get("content-security-policy"));
  } catch (e) {
    console.log(url, "Error:", e.message);
  }
}

check("https://www.geeksforgeeks.org/");
check("https://developer.mozilla.org/");
check("https://www.freecodecamp.org/");
