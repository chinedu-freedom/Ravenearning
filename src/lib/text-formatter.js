export default function firstLetterUpercaseFormatter(str) {
  const nameArr = str?.split(" ")?.filter(Boolean);

  const name =
    str &&
    nameArr
      ?.map(
        (item) => `${item[0]?.toUpperCase()}${item?.slice(1)?.toLowerCase()}`
      )
      ?.join(" ");

  return name;
}

export function capitalizeFormatter(str) {
  const nameArr = str?.split(" ")?.filter(Boolean);
  const name = str && nameArr?.map((item) => item?.toUpperCase())?.join(" ");

  return name;
}

export function stringLengthFormat(str, strLength = 15) {
  const strLengthCheck = str?.length <= strLength;

  let result;

  if (strLengthCheck) {
    result = str;
  } else {
    result = `${str?.slice(0, strLength)}...`;
  }

  return result;
}
