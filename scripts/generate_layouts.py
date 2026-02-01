import os
import re

# Simple regex to parse the typescript file
# We are looking for lines like: { title: '...', description: '...', href: '...', ... }

def parse_tools_data(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Find all objects in arrays
    # This is a bit rough but should work for the uniform format we have
    pattern = r"\{\s*title:\s*'([^']+)',\s*description:\s*'([^']+)',\s*href:\s*'([^']+)'"
    
    matches = re.finditer(pattern, content)
    tools = []
    for match in matches:
        tools.append({
            'title': match.group(1),
            'description': match.group(2),
            'href': match.group(3)
        })
    return tools

def generate_layout(tool_dir, title, description):
    # Escape quotes in title/description just in case
    title = title.replace("'", "\\'")
    description = description.replace("'", "\\'")
    
    layout_content = f"""import type {{ Metadata }} from "next";

export const metadata: Metadata = {{
  title: '{title} - Free Online Tool | Tools24Now',
  description: '{description}. Fast, secure, and free online tool. No signup required.',
  openGraph: {{
    title: '{title} | Tools24Now',
    description: '{description}',
  }}
}};

export default function Layout({{
  children,
}}: Readonly<{{
  children: React.ReactNode;
}}>) {{
  return children;
}}
"""
    return layout_content

def main():
    base_dir = os.getcwd()
    tools_data_path = os.path.join(base_dir, 'frontend/lib/tools-data.ts')
    frontend_app_dir = os.path.join(base_dir, 'frontend/app')
    
    if not os.path.exists(tools_data_path):
        print(f"Error: Could not find {tools_data_path}")
        return

    print(f"Parsing tools from {tools_data_path}...")
    tools = parse_tools_data(tools_data_path)
    print(f"Found {len(tools)} tools.")

    created_count = 0
    skipped_count = 0

    for tool in tools:
        # href is like '/pdf-to-images', so we remove leading slash to get dir name
        dir_name = tool['href'].lstrip('/')
        target_dir = os.path.join(frontend_app_dir, dir_name)
        
        if os.path.exists(target_dir):
            layout_path = os.path.join(target_dir, 'layout.tsx')
            
            # Check if layout already exists - we might want to overwrite or skip
            # For this task, let's overwrite to ensure SEO compliance
            
            content = generate_layout(target_dir, tool['title'], tool['description'])
            
            with open(layout_path, 'w') as f:
                f.write(content)
            
            # print(f"Generated layout for {dir_name}")
            created_count += 1
        else:
            print(f"Warning: Directory not found for {dir_name} (href: {tool['href']})")
            skipped_count += 1

    print("-" * 30)
    print(f"Total Layouts Generated: {created_count}")
    print(f"Skipped (Dir not found): {skipped_count}")

if __name__ == "__main__":
    main()
