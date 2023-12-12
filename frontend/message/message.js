const statusList = {
  1: "Ошибки не было",
  2: "Ошибка была, получилось исправить",
  3: "Ошибка была, не смогли исправить",
  4: "Ошибка была, не нашли",
}

export const message = (original, encoded, corrupted, decoded, errorCount, status) => {
	return `
<div class="message-${status}">
  <div class="errors_count">Количество ошибок: ${errorCount}</div>
  
  <div class="comparison">
    <div>
      <div class="corrupted">Полученное сообщение: ${corrupted}</div>
      <div class="encoded">Отправленное сообщение: ${encoded}</div>
    </div>

    <div>
      <div class="decoded">Раскодированное сообщение: ${decoded}</div>
      <div class="original">Оригинальное сообщение: ${original}</div>
    </div>
  </div>
  
  <div class="conclusion">${statusList[status]}</div>
</div>
	`;
}