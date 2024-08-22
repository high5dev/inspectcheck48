export default function V00042_AddTakenAtToMediaTable() {
  function version() {
    return 42
  }

  function title() {
    return "Add Taken At To Medi Table";
  }

  function step() {
    return "alter table media\n" +
      "\tadd takenAt integer default 0;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}