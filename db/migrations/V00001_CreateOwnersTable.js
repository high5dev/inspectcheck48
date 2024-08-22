export default function V00001_CreateOwnersTable(){
  function version(){
    return 1;
  }
  function title(){
    return "Create Owners Table";
  }
  function step(){
    return "CREATE TABLE owners\n" +
      "(\n" +
      "    id INTEGER PRIMARY KEY,\n" +
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