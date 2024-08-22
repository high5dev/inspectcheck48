export default function V00027_CopyFindingAssetData() {
  function version() {
    return 27
  }

  function title() {
    return "Copy Finding Asset Data";
  }

  function step() {
    return "insert into finding_asset_dg_tmp(id, inspection_id, asset_id, compliant, risk_level, notes, discovered_date, resolve_by_date, resolved_date) select id, inspection_id, asset_id, compliant, risk_level, notes, discovered_date, resolve_by_date, resolved_date from finding_asset;\n";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}