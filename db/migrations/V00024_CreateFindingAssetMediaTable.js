export default function V00024_CreateFindingAssetMediaTable() {
  function version() {
    return 24
  }

  function title() {
    return "Create Finding Asset Media Table";
  }

  function step() {
    return "create table finding_asset_media\n" +
      "(\n" +
      "\tid text,\n" +
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