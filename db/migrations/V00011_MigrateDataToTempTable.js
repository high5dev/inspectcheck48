export default function V00011_MigrateDataToTempTable(){
  function version(){
    return 11;
  }
  function title(){
    return "Migrate Temp Data";
  }
  function step(){
    return "insert into playgrounds(id, agency_id, name, location_notes, lat, lon) select id, agency_id, name, notes, 0, 0 from sites;"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}