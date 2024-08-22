export default function V00007_ChangeSitesToPlaygrounds(){
  function version(){
    return 7;
  }
  function title(){
    return "Change Sites To Playgrounds";
  }
  function step(){
    return "create table playgrounds\n" +
      "(\n" +
      "\tid TEXT\n" +
      "\t\tprimary key,\n" +
      "\tagency_id TEXT default '' not null,\n" +
      "\tname TEXT default '' not null,\n" +
      "\tlocation_notes TEXT default '' not null,\n" +
      "\tlat numeric default 0 not null,\n" +
      "\tlon numeric default 0 not null\n" +
      ");\n" +
      "\n" +
      "insert into playgrounds(id, agency_id, name, location_notes, lat, lon) select id, agency_id, name, notes, 0, 0 from sites;\n" +
      "\n" +
      "drop table sites;\n" +
      "\n" +
      "alter table playgrounds rename to playgrounds;\n" +
      "\n"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}