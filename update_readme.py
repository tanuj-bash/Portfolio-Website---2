import os
import re
from datetime import datetime

# 1. Gather the data you want to automate
def get_repo_stats():
    html_files = len([f for f in os.listdir('.') if f.endswith('.html')])
    css_files = len([f for f in os.listdir('.') if f.endswith('.css')])
    js_files = len([f for f in os.listdir('.') if f.endswith('.js')])
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Format the data into Markdown
    return f"""
> **LAST SYSTEM OVERRIDE:** {timestamp}

*   **HTML Interfaces:** {html_files}
*   **CSS Architectures:** {css_files}
*   **JS Logic Controllers:** {js_files}
"""

# 2. Read the current README
with open('README.md', 'r') as file:
    readme_content = file.read()

# 3. Inject the new data between the HTML comment tags
new_content = get_repo_stats()
pattern = r'(<!-- START_AUTO_UPDATE -->\n).*?(\n<!-- END_AUTO_UPDATE -->)'
updated_readme = re.sub(pattern, rf'\1{new_content}\2', readme_content, flags=re.DOTALL)

# 4. Save the updated README
with open('README.md', 'w') as file:
    file.write(updated_readme)

print("SYSTEM AUTOMATION: README.md successfully overwritten.")