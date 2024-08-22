export default function V00010_RenameTempTableToAgencies(){
  function version(){
    return 10;
  }
  function title(){
    return "Rename Temp Table to Agencies";
  }
  function step(){
    return "alter table agencies_dg_tmp rename to agencies;"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}