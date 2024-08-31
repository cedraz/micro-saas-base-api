export function createEmailTemplate({ message }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
        <p>${message}</p>
    </div>`;

  return { html };
}
