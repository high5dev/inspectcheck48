export default function V00032_AddTitleColumnToInspectionMxItemsTable() {
  function version() {
    return 32
  }

  function title() {
    return "Add Title Column to Inspection Mx Items Table";
  }

  function step() {
    return "alter table inspection_mx_items\n" +
      "\tadd title text;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}