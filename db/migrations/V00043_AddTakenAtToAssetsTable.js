export default function V00043_AddTakenAtToAssetsTable() {
  function version() {
    return 43
  }

  function title() {
    return "Add Taken At To Assets Table";
  }

  function step() {
    return "alter table assets\n" +
      "\tadd takenAt integer default 0;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}