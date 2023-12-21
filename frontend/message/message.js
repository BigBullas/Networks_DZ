const statusList = {
  1: "Ошибки не было",
  2: "Ошибка была, получилось исправить",
  3: "Ошибка была, не смогли исправить",
  4: "Ошибка была, не нашли",
}

export const message = (original, encoded, corrupted, decoded, errorCount, status) => {
	return `
<div class="message-${status} message_box">
  <div class="message_header">
    <div class="conclusion">${statusList[status]}</div>
    <div class="errors_count">Количество ошибок: ${errorCount}</div>
  </div>
  <hr>
  <div class="comparison">
    <div>
      <div class="corrupted">Полученное сообщение:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${corrupted}</div>
      <div class="encoded">Отправленное сообщение: &nbsp; ${encoded}</div>
    </div>

    <div>
      <div class="decoded">Раскодированное сообщение:&nbsp; ${decoded}</div>
      <div class="original">Оригинальное сообщение:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${original}</div>
    </div>
  </div>
</div>
	`;
}