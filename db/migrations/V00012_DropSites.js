export default function V00012_DropSitesTable(){
  function version(){
    return 12;
  }
  function title(){
    return "Drop Sites Table";
  }
  function step(){
    return "drop table sites;"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}