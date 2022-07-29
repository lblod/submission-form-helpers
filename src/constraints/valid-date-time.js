import moment from "moment";
/**
 * Checks if the given string is an valid date-time format conform to xsd:datetime.
 * Expected datetime format ex: 01-01-2020T01:01:01Z
 */
export default function constraintValidDateTime(value) {
  if(value.datatype.value !== "http://www.w3.org/2001/XMLSchema#dateTime"){
    return false;
 }
  return validDateTimeString(value.value);
}

function validDateTimeString(value) {
  // Assumed xsd:dateTime is a subset of ISO8601
  // http://books.xmlschemata.org/relaxng/ch19-77049.html and
  // https://www.w3.org/TR/xmlschema-2/#dateTime
  //Source of this ugly expression https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s07.html
  const xsdDateTimeRegex = new RegExp(`^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9])(:?[0-5][0-9])?)?$`);

  //To make sure the regex after this one does not break existing stuff. I keep this check here
  if (moment(value, "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).isValid()){
    return true;
  }
  // Here moment does the job checking it is an valid date (doest it exist),
  // the next check is solely a syntactic check (to match against the lexical values allowed in xsd)
  else if(moment(value, moment.ISO_8601, true).isValid() && value.match(xsdDateTimeRegex, 'g')){
    return true;
  }
  else {
    return false;
  }
}
