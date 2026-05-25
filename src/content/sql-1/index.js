import lesson1 from "./sql1-001-what-is-a-database.js";
import lesson2 from "./sql1-002-select-query.js";
import lesson3 from "./sql1-003-aggregation.js";
import lesson4 from "./sql1-004-joins.js";
import lesson5 from "./sql1-005-indexes.js";
import lesson6 from "./sql1-006-acid.js";

export default {
  id: "sql-1",
  number: "sql-1",
  title: "Python + SQL",
  slug: "sql-1",
  description:
    "SQL with Python as the runtime. Use the sqlite3 module to write queries, manage connections, and integrate relational data into Python programs. Prerequisite: Python fundamentals.",
  color: "blue",
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6],
};
