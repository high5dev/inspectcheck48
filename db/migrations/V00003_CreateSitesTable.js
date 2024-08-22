export default function V00003_CreateSitesTable(){
  function version(){
    return 3;
  }
  function title(){
    return "Create Sites Table";
  }
  function step(){
    return "CREATE TABLE sites\n" +
      "(\n" +
      "    id INTEGER PRIMARY KEY,\n" +
      "    agency_id INTEGER NOT NULL DEFAULT 0,\n" +
      "    name TEXT NOT NULL DEFAULT '',\n" +
      "    poc  TEXT NOT NULL DEFAULT '',\n" +
      "    address1      TEXT NOT NULL DEFAULT '',\n" +
      "    address2      TEXT NOT NULL DEFAULT '',\n" +
      "    city      TEXT NOT NULL DEFAULT '',\n" +
      "    state      TEXT NOT NULL DEFAULT '',\n" +
      "    zip      TEXT NOT NULL DEFAULT '',\n" +
      "    phone      TEXT NOT NULL DEFAULT '',\n" +
      "    email      TEXT NOT NULL DEFAULT ''\n" +
      ");"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}