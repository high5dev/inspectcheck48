export default function V00008_MigrateAgencyData(){
  function version(){
    return 8;
  }
  function title(){
    return "Migrate Data To Temp Table";
  }
  function step(){
    return "insert into agencies_dg_tmp(id, name, poc, address1, address2, city, state, zip, phone, email, notes) select id, name, poc, address1, address2, city, state, zip, phone, email, notes from agencies;"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}