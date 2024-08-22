export default function V00038_CopyUniqueDataToFindingAssetMediaTempTable() {
  function version() {
    return 38
  }

  function title() {
    return "Copy Unique Data To Finding Asset Media Temp Table";
  }

  function step() {
    return "insert into finding_asset_media_dg_tmp(id, finding_id, media_id, notes) select id, finding_id, media_id, notes from finding_asset_media GROUP BY id;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}