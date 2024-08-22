export default function V00031_CreateInspectionMxItemsTable() {
  function version() {
    return 31
  }

  function title() {
    return "Create Inspection Mx Items Table";
  }

  function step() {
    return "create table inspection_mx_items\n" +
      "(\n" +
      "\tid text\n" +
      "\t\tconstraint inspection_mx_items_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tinspection_id text,\n" +
      "\tasset_id text,\n" +
      "\tmx_id integer default 0,\n" +
      "\tnotes text\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}