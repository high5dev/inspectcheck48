export default function V00051_AddDeletedToAssetsTable() {
  function version() {
    return 51
  }

  function title() {
    return "Add Deleted To Assets Table";
  }

  function step() {
    return "alter table assets\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}