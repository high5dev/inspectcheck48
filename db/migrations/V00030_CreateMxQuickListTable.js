export default function V00030_CreateMxQuickListTable() {
  function version() {
    return 30
  }

  function title() {
    return "Create Mx Quick List Table";
  }

  function step() {
    return "create table mx_quick_list\n" +
      "(\n" +
      "\tid int,\n" +
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