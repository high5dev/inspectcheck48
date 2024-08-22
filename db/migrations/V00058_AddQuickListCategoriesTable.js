export default function V00058_AddQuickListCategoriesTable() {
  function version() {
    return 58
  }

  function title() {
    return "Add Quick List Categories Table";
  }

  function step() {
    return "create table quick_list_categories\n" +
      "(\n" +
      "\tid int\n" +
      "\t\tconstraint quick_list_categories_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tdisplay text\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}