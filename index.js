const fs = require('fs');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

const getQuizletData = async () => {
  const options = new chrome.Options();
  options.addArguments('headless');
  options.addArguments('disable-gpu');
  options.addArguments('no-sandbox');
  options.addArguments('disable-dev-shm-usage');
  options.setUserPreferences({ credential_enable_service: false });
  
  //disable cors
  options.addArguments('disable-web-security');
  //disable network and javascript
  options.setUserPreferences({ profile: { default_content_setting_values: { images: 2 } } });

  // Create the driver and set options
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    const url = 'file:///C:/Users/Kongou/Downloads/ISC301%20-%20FPT%20Final%20Flashcards%20_%20Quizlet.html';
    await driver.get(url);

    // Wait for the element with the aria-label "See more" to be present
    const containerButton = await driver.wait(until.elementLocated(By.className("siycb3m")));
    await containerButton.click();

    // Wait for the elements with class "SetPageTerm-wordText" to be present
    await driver.wait(until.elementsLocated(By.className('SetPageTerm-wordText')), 20000);
    const wordElements = await driver.findElements(By.className('SetPageTerm-wordText'));

    // Wait for the elements with class "SetPageTerm-definitionText" to be present
    await driver.wait(until.elementsLocated(By.className('SetPageTerm-definitionText')), 20000);
    const definitionElements = await driver.findElements(By.className('SetPageTerm-definitionText'));

    const words = await Promise.all(wordElements.map((element) => element.getText()));
    const definitions = await Promise.all(definitionElements.map((element) => element.getText()));

    const data = words.map((word, index) => {
        const definitionsArray = definitions[index].split('\n');
        const formattedWord = word.toLowerCase();
        // Find the definition that starts with "QN" (the question)
        const question = definitionsArray.find((definition) => definition.startsWith('QN'));
        // Find the definition that starts with the correct answer (indicated by a dot after the letter)
        const correctAnswer = definitionsArray.find((definition) => definition.match(formattedWord + '\\.'));
        const formattedQuestion = question ? question.replace(/QN=\d+/, '').trim() : console.log(index,formattedWord);
        //change all capital letter to lower case
        const formattedAnswer = correctAnswer ? correctAnswer.replace(formattedWord + '.', '').trim() : '';
        const formattedData = `${formattedQuestion}|${formattedAnswer}`;
      
        return formattedData;
      });
      

    fs.writeFile('data.txt',JSON.stringify(data, null, 2), (err) => {
      if (err) throw err;
      console.log('Data saved!');
      console.log(data.length)
    });
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await driver.quit();
  }
};

getQuizletData();
