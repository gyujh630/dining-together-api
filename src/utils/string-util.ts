export function splitStringByComma(inputString: string) {
  const resultArray = inputString.split(',');
  return resultArray;
}

export const seoulRegionList = [
  '강남',
  '서초',
  '잠실/송파/강동',
  '영등포/여의도/강서',
  '건대/성수/왕십리',
  '종로/중구',
  '홍대/합정/마포',
  '용산/이태원/한남',
  '성북/노원/중랑',
  '구로/관악/동작',
];

export function isDateCloseDay(date: string, closeDay: string) {
  if (!isValidCloseDay(closeDay) || closeDay === '없음') return false;

  const resultArray = closeDay.split(' ');
  const closeWeeks = resultArray[0].split('/');
  const closeDays = resultArray[1].split('/');
  const closeWeeksAsNumbers = convertStringToNumber(closeWeeks, weekMap);

  var parts = date.split('-');

  var year = parseInt('20' + parts[0]);
  var month = parseInt(parts[1]) - 1;
  var day = parseInt(parts[2]);

  const dateObj = new Date(year, month, day);
  var options: any = { weekday: 'short', timeZone: 'Asia/Seoul' };
  var formatter = new Intl.DateTimeFormat('ko-KR', options);

  var dayOfWeek = formatter.format(dateObj);
  const weekNumber = Math.ceil((day + 1) / 7);

  if (closeWeeksAsNumbers[0] === 0) {
    return closeDay.includes(dayOfWeek);
  } else {
    if (closeWeeksAsNumbers.includes(weekNumber)) {
      return closeDays.includes(dayOfWeek);
    }
  }
}

export function isValidCloseDay(closeDay: string) {
  if (closeDay === '없음') {
    return true;
  } else if (
    closeDay.split(' ').length > 2 ||
    closeDay.split(' ').length <= 1
  ) {
    return false;
  }
  const resultArray = closeDay.split(' ');
  const week = resultArray[0].split('/');
  const day = resultArray[1].split('/');
  if (week.includes('매주') && week.length >= 2) {
    return false;
  } else {
    for (var i = 0; i < week.length; i++) {
      if (
        week[i] !== '매주' &&
        week[i] !== '첫째주' &&
        week[i] !== '둘째주' &&
        week[i] !== '셋째주' &&
        week[i] !== '넷째주'
      ) {
        return false;
      }
    }
    for (var i = 0; i < day.length; i++) {
      if (
        day[i] != '월' &&
        day[i] != '화' &&
        day[i] != '수' &&
        day[i] != '목' &&
        day[i] != '금' &&
        day[i] != '토' &&
        day[i] != '일'
      ) {
        return false;
      }
    }
  }
  return true;
}

// 주차와 요일을 숫자로 매핑하는 맵
const weekMap: { [key: string]: number } = {
  매주: 0,
  첫째주: 1,
  둘째주: 2,
  셋째주: 3,
  넷째주: 4,
};

const dayMap: { [key: string]: number } = {
  일: 1,
  월: 2,
  화: 3,
  수: 4,
  목: 5,
  금: 6,
  토: 7,
};

// 문자열을 숫자로 변환하는 함수
function convertStringToNumber(
  inputArray: string[],
  map: { [key: string]: number }
): number[] {
  return inputArray.map((item) => map[item]);
}

export const isEmailValid = function (email: string): boolean {
  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;
  return emailRegEx.test(email);
};

export const isPasswordValid = function (password: string): boolean {
  const passwordRegEx =
    /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
  return passwordRegEx.test(password);
};

// UTC 시간을 한국 시간으로 변환하는 함수
export const convertUtcToKoreaTime = (utcDate: Date): Date => {
  const koreaOffset = 9 * 60 * 60 * 1000; // 한국 : UTC+9
  const koreaTime = new Date(utcDate.getTime() + koreaOffset);
  return koreaTime;
};
