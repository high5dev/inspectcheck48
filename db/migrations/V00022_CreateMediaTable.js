export default function V00022_CreateMediaTable() {
  function version() {
    return 22
  }

  function title() {
    return "Create Media Table";
  }

  function step() {
    return "create table media\n" +
      "(\n" +
      "\tid text\n" +
      "\t\tconstraint media_pk\n" +
      "\t\t\tprimary key,\n" +
      "\texif text,\n" +
      "\theight integer default 0,\n" +
      "\twidth integer default 0,\n" +
      "\turi text,\n" +
      "\tuploaded integer default 0 not null\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}