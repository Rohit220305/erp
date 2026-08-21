const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('/var/www/html/training/erp/erp-frontend/src/components');

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('const customSelectStyles') && !content.includes('dropdownIndicator:')) {
    
    // We want to insert the dropdownIndicator property before the closing `});` of the customSelectStyles object.
    // The easiest way is to find the exact end of customSelectStyles. 
    // They generally end with:
    //   placeholder: (base) => ({
    //     ...
    //   }),
    // });
    // Let's use a regex to match the end of the object block:
    
    const replacement = `,
  dropdownIndicator: (base, state) => ({
    ...base,
    transition: "all .2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
  })
});`;
    
    // Replace the very last `});` of customSelectStyles definition.
    // Or simpler: match the exact `  }),\n});` assuming standard formatting.
    
    // Let's do a reliable replacement by replacing `  }),\n});` -> `  }),${replacement}`
    // But we need to make sure we only replace the one for customSelectStyles.
    
    // More robust way: match `const customSelectStyles = (error, disabled) => ({` or `const customSelectStyles = {`
    // and find its closing brace.
    // Given the uniform formatting from the prompt, we can use a simpler replacement:
    
    const target1 = `    color: "#9ca3af",\n  }),\n});`;
    const target2 = `    color: "#9ca3af",\n  }),\n};`;
    const target3 = `    color: disabled ? "#9ca3af" : "#1f2937",\n  }),\n});`; // maybe they don't have placeholder
    
    if (content.includes(target1)) {
        content = content.replace(target1, target1.replace('});', replacement.slice(1)));
        fs.writeFileSync(file, content);
        count++;
        console.log("Updated: " + file);
    } else if (content.includes(target2)) {
        content = content.replace(target2, target2.replace('};', replacement.slice(1).replace('});', '};')));
        fs.writeFileSync(file, content);
        count++;
        console.log("Updated: " + file);
    } else {
        // Try a more generic regex for the end of the styles block
        // Looking for `  }),\n});` or `  }),\n};`
        let match = content.match(/  \}\),\n\}(;?)\n/);
        if (match) {
            content = content.replace(match[0], `  }),\n  dropdownIndicator: (base, state) => ({\n    ...base,\n    transition: "all .2s ease",\n    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,\n  }),\n}${match[1]}\n`);
            fs.writeFileSync(file, content);
            count++;
            console.log("Updated (Regex): " + file);
        } else {
            console.log("Could not find insertion point for: " + file);
        }
    }
  }
});
console.log("Total updated: " + count);
