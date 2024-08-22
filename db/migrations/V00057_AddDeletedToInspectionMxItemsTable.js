export default function V00057_AddDeletedToInspectionMxItemsTable() {
  function version() {
    return 57
  }

  function title() {
    return "Add Deleted To Inspection Mx Items Table";
  }

  function step() {
    return "alter table inspection_mx_items\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}