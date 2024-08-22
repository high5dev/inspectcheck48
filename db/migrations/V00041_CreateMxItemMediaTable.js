export default function V00041_CreateMxItemMediaTable() {
  function version() {
    return 41
  }

  function title() {
    return "Create Mx Item Media Table";
  }

  function step() {
    return "create table mx_item_media\n" +
      "(\n" +
      "\tid text\n" +
      "\t\tconstraint mx_item_media_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tmx_id text,\n" +
      "\tmedia_id text,\n" +
      "\tnotes text\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}