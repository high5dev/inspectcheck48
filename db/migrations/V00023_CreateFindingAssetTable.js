export default function V00023_CreateFindingAssetTable() {
  function version() {
    return 23
  }

  function title() {
    return "Create Finding Asset Table";
  }

  function step() {
    return "create table finding_asset\n" +
      "(\n" +
      "\tid text,\n" +
      "\tinspection_id text,\n" +
      "\tasset_id text,\n" +
      "\tcompliant int default 0,\n" +
      "\trisk_level int default 2,\n" +
      "\tnotes text default '',\n" +
      "\tdiscovered_date datetime,\n" +
      "\tresolve_by_date datetime,\n" +
      "\tresolved_date datetime\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}