export default function V00044_AddTakenAtToFindingAssetMediaTable() {
  function version() {
    return 44
  }

  function title() {
    return "Add Taken At To Finding Asset Media Table";
  }

  function step() {
    return "alter table finding_asset_media\n" +
      "\tadd takenAt integer default 0;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}