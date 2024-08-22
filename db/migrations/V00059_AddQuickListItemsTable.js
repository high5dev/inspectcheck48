export default function V00058_AddQuickListItemsTable() {
  function version() {
    return 59
  }

  function title() {
    return "Add Quick List Items Table";
  }

  function step() {
    return "create table quick_list_items\n" +
      "(\n" +
      "\tid int\n" +
      "\t\tconstraint quick_list_items_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tcategory_id int,\n" +
      "\ttitle text,\n" +
      "\ttemplate text,\n" +
      "\t[references] text\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}