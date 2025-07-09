interface Article {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Экспорт в Markdown/Export to Markdown
export const exportToMarkdown = (article: Article): string => {
  const date = new Date(article.createdAt).toLocaleDateString();
  const tags = article.tags.length > 0 ? `\n\n**Теги:** ${article.tags.map(tag => `#${tag}`).join(', ')}` : '';
  
  // Конвертируем HTML в Markdown
  let markdown = article.content
    .replace(/<h1>(.*?)<\/h1>/g, '# $1')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>(.*?)<\/li>/g, '- $1')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '')
    .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, ''); // Удаляем остальные HTML теги

  return `# ${article.title}\n\n**Дата создания:** ${date}\n**Статус:** ${article.isPublic ? 'Публичная' : 'Приватная'}${tags}\n\n---\n\n${markdown}`;
};

// Экспорт в HTML/Export to HTML
export const exportToHTML = (article: Article): string => {
  const date = new Date(article.createdAt).toLocaleDateString();
  const tags = article.tags.length > 0 
    ? `<div class="tags"><strong>Теги:</strong> ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</div>` 
    : '';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .meta { color: #6b7280; margin-bottom: 20px; font-size: 14px; }
        .tags { margin-top: 20px; }
        .tag { 
            background: #eff6ff; 
            color: #2563eb; 
            padding: 2px 8px; 
            border-radius: 12px; 
            font-size: 12px; 
            margin-right: 5px;
        }
        blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 20px 0;
            padding-left: 16px;
            color: #6b7280;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <h1>${article.title}</h1>
    <div class="meta">
        <strong>Дата создания:</strong> ${date}<br>
        <strong>Статус:</strong> ${article.isPublic ? 'Публичная' : 'Приватная'}
    </div>
    ${tags}
    <div class="content">
        ${article.content}
    </div>
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        Создано с помощью PostHaste
    </footer>
</body>
</html>`;
};

// Экспорт в JSON/Export to JSON
export const exportToJSON = (article: Article): string => {
  return JSON.stringify(article, null, 2);
};

// Экспорт в текстовый формат/Export to plain text
export const exportToText = (article: Article): string => {
  const date = new Date(article.createdAt).toLocaleDateString();
  const tags = article.tags.length > 0 ? `\n\nТеги: ${article.tags.map(tag => `#${tag}`).join(', ')}` : '';
  
  // Удаляем HTML теги и форматирование
  const plainText = article.content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  return `${article.title}\n\nДата создания: ${date}\nСтатус: ${article.isPublic ? 'Публичная' : 'Приватная'}${tags}\n\n${'-'.repeat(50)}\n\n${plainText}`;
};

// Универсальная функция скачивания/Universal download function
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Экспорт всех статей/Export all articles
export const exportAllArticles = (articles: Article[], format: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (format) {
    case 'json':
      downloadFile(
        JSON.stringify(articles, null, 2),
        `posthaste-articles-${timestamp}.json`,
        'application/json'
      );
      break;
    
    case 'markdown':
      const markdownContent = articles.map(article => exportToMarkdown(article)).join('\n\n---\n\n');
      downloadFile(
        markdownContent,
        `posthaste-articles-${timestamp}.md`,
        'text/markdown'
      );
      break;
    
    case 'html':
      const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Экспорт статей PostHaste</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .article { margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
        h1 { color: #2563eb; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Экспорт статей PostHaste</h1>
    <p>Дата экспорта: ${new Date().toLocaleDateString()}</p>
    ${articles.map(article => `
    <div class="article">
        <h2>${article.title}</h2>
        <div class="meta">
            Создано: ${new Date(article.createdAt).toLocaleDateString()} | 
            Статус: ${article.isPublic ? 'Публичная' : 'Приватная'}
            ${article.tags.length > 0 ? ` | Теги: ${article.tags.join(', ')}` : ''}
        </div>
        ${article.content}
    </div>
    `).join('')}
</body>
</html>`;
      downloadFile(htmlContent, `posthaste-articles-${timestamp}.html`, 'text/html');
      break;
  }
};
