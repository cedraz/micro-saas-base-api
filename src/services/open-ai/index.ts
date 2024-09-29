export async function GPTMock(data: any) {
  console.log('GPTMock', data);
  return {
    data: {
      choices: [
        {
          text: 'This is a mock response from GPT-3.',
        },
      ],
    },
  };
}
