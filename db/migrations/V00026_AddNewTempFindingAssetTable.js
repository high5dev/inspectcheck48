export default function V00026_AddNewTempFindingAssetTable() {
  function version() {
    return 26
  }

  function title() {
    return "Add New Temp Finding Asset Table";
  }

  function step() {
    return "create table finding_asset_dg_tmp\n" +
      "(\n" +
      "\tid text\n" +
      "\t\tconstraint finding_asset_pk\n" +
      "\t\t\tprimary key,\n" +
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