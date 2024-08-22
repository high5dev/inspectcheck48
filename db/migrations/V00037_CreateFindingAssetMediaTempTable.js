export default function V00037_CreateFindingAssetMediaTempTable() {
  function version() {
    return 37
  }

  function title() {
    return "Create Finding Asset Media Temp Table";
  }

  function step() {
    return "create table finding_asset_media_dg_tmp\n" +
      "(\n" +
      "\tid text\n" +
      "\t\tconstraint finding_asset_media_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tfinding_id text,\n" +
      "\tmedia_id text,\n" +
      "\tnotes text\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}