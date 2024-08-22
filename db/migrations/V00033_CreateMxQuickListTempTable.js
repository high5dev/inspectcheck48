export default function V00033_CreateMxQuickListTempTable() {
  function version() {
    return 33
  }

  function title() {
    return "Create Mx Quick List Temp Table";
  }

  function step() {
    return "create table mx_quick_list_dg_tmp\n" +
      "(\n" +
      "\tid int\n" +
      "\t\tconstraint mx_quick_list_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tdisplay text,\n" +
      "\ttemplate text\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}