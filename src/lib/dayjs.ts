import dayjs from 'dayjs'
import dayJsFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br');
dayjs.extend(dayJsFormat);

export { dayjs };