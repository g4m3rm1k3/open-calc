import lesson1 from "./nosql1-001-why-nosql.js";
import lesson2 from "./nosql1-002-document-stores.js";
import lesson3 from "./nosql1-003-cap-theorem.js";
import lesson4 from "./nosql1-004-sql-vs-nosql.js";

export default {
  id: "nosql-1",
  number: "nosql-1",
  title: "NoSQL Databases",
  slug: "nosql-1",
  description:
    "Document stores, key-value systems, CAP theorem, and the decision framework " +
    "for choosing the right database for any problem.",
  color: "green",
  lessons: [lesson1, lesson2, lesson3, lesson4],
};
