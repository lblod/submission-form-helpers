export default function constraintsRequired(values/*, options*/) {
  const hasValues = values.length > 0 ? true : false;
  if(!hasValues){
    return false;
  }

  for(const value of values){
    if(value.value.length == 0){
      return false;
    }
  }
  return true;
}