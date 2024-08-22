export default function V00055_AddDeletedToFindingAssetMediaTable() {
  function version() {
    return 55
  }

  function title() {
    return "Add Deleted To Finding Asset Media Table";
  }

  function step() {
    return "alter table finding_asset_media\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}