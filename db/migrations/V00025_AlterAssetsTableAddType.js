export default function V00025_AlterAssetsTableAddType() {
  function version() {
    return 25
  }

  function title() {
    return "Alter Assets Table Add Type";
  }

  function step() {
    return "alter table assets\n" +
      "\tadd type int default 0;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}