import React from 'react';

const RichTextEditor = ({ isEditing, editorStyles, handleBlur, htmlValue, setHtmlValue }) => {
  return (
    <div>
      {isEditing && (
        <div
          id='rich-text-editor'
          contentEditable
          style={editorStyles}
          onBlur={handleBlur}
          // Dangerously set the HTML so you see bold/italic in the overlay
          dangerouslySetInnerHTML={{ __html: htmlValue }}
          onInput={e => {
            // TypeScript note: currentTarget is a HTMLElement in a div's onInput
            const newHtml = (e.currentTarget as HTMLDivElement).innerHTML;
            setHtmlValue(newHtml);
          }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
