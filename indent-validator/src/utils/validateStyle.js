const validateStyle = {};

module.exports = validateStyle;

validateStyle.validateHtml = {
  // tags that do not impact indentation.
  // those who will have attributes with them will be left with a space.
  specialTags: {
    '<img': '<img',
    '<input': '<input',
    '<area': '<area',
    '<base': '<base',
    '<br': '<br',
    '<col': '<col',
    '<command': '<command',
    '<embed': '<embed',
    '<hr>': '<hr>',
    '<keygen>': '<keygen>',
    '<link': '<link',
    '<param': '<param',
    '<source': '<source',
    '<track': "<track",
    '<wbr>': '<wbr>',
    '<title>': '<title>',
    '</title>': '</title>',
    '<meta': '<meta',
    '<html': '<html',
    '<!DOCTYPE': '<!DOCTYPE',
    '</html>': '</html>',
    '</strong>': '</strong>',
    '<strong>': '<strong>',
    '<del>': '<del>',
    '</del>': '</del>',
  },
  openTags: 0, // levels of nesting (this * indentMultiplier = number of spaces)
  expectedIndentation: 0,
  currentIndentation: 0,
  faultyLines: [], // lines where indentation is broken.

  /**
   * 
   * @param {string} htmlString html to be validated
   * @param {number} [indentMultiplier=2] the size of each tab, default is 2
   */
  validateIndentation(htmlString, indentMultiplier) {
    // set default value for indentation and split the html string into an array

    indentMultiplier = indentMultiplier || 2;
    const arrayFromString = htmlString.split('\n');

    // loop over the array and decide where to add/remove levels of indentation.
    arrayFromString.forEach((element, index) => {

      // 3 types of tags. 1- opening adds levels of indentation (1 * multiplier).
      if (this.tagType(element) === 'opening') {
        // opening tags follow the previous indentaion level. 
        // Checks happen before adding a level.

        // get the current indentation level
        this.currentIndentation = element.length - element.trimStart().length;
        /*
          using trimStart above for two reasons:
            1 - in case a user adds a white space, we can reliably check indentation
            2- some inline elements like p can be in one line or in two, which will affect indentation
            trim removes \n so it's not going to be easy to catch. I am too lazy to do this check anyway.
            compare current vs expected levels. If broken push to array, else do nothing.
        */

        this.currentIndentation !== this.expectedIndentation
          ? this.faultyLines.push({
            currentIndentation: this.currentIndentation,
            expectedIndentation: this.expectedIndentation,
            line: index + 1
          })
          : null

        // add a level of indentation 
        this.openTags++;
        this.expectedIndentation = this.openTags * indentMultiplier;
      }
      // closing tag: they follow the same indent level as their opening counterparts.
      // reduce number of open tags and expected indentation before any checks.
      else if (this.tagType(element) === 'closing') {
        // set expected indent level and get the current indentation
        this.openTags--;
        this.expectedIndentation = this.openTags * indentMultiplier;
        this.currentIndentation = element.length - element.trimStart().length;

        // compare expected vs current. If broken push to arrya, if not do nothing.
        this.currentIndentation !== this.expectedIndentation
          ? this.faultyLines.push({
            currentIndentation: this.currentIndentation,
            expectedIndentation: this.expectedIndentation,
            line: index + 1
          })
          : null
      }

      // lastly, special tags and textContent. No indent changes, 
      // just check if expected and actual match
      else if (!this.tagType(element)) {
        this.currentIndentation = element.length - element.trimStart().length;
        this.currentIndentation !== this.expectedIndentation
          ? this.faultyLines.push({
            currentIndentation: this.currentIndentation,
            expectedIndentation: this.expectedIndentation,
            line: index + 1
          })
          : null
      }
    });

    // maybe send an html response with red highlighting on bad indentations or something.
    console.log(this.faultyLines);
  },

  /**
   * 
   * @param {string} element incoming stringified html will be split over \n and iterated over.
   * element is the resulting array content.
   */
  // special tags will not affect indentation.
  checkSpecialTag(element) {
    // elements like <img src...> are best checked via the space 
    // since they can have any kind of content between the < and > symbols
    // elements like </html> can be safely and predictably checked via the > symbol.
    const firstCondition = element.trimStart().substring(0, element.trimStart().indexOf(' '));
    const secondCondition = element.trimStart().substring(0, element.trimStart().indexOf('>') + 1);
    const firstCase = this.specialTags[firstCondition];
    const secondCase = this.specialTags[secondCondition];
    return firstCase || secondCase;
  },

  /**
   * 
   * @param {string} element
   * @returns {(bool | string)} returns one of 3: 'opening', 'closing' and null for special tags. 
   */
  // checks if the tag is opening, closing, or special/text
  tagType(element) {
    // has to be a tag (starts with <) and cannot be special. All that remains is to look for the /
    const commonCheck = (element.trimStart().startsWith('<') && !this.checkSpecialTag(element));
    const closing = (
      commonCheck
      && element.trimStart()[1] === '/'  // if second char after trim is / it's a closing tag
    );
    const opening = (
      commonCheck
      && element.trimStart()[1] !== '/'  // if second char after trim is / it's a closing tag
    );
    const type = closing ? 'closing' : opening ? 'opening' : null;
    return type;
  },
}
