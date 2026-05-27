import os

src_dir = r'c:\Users\adity\Desktop\flight-frontend\app\group-travel'
dest_dir = r'c:\Users\adity\Desktop\flight-frontend\app\b2b\group-travel'

def process_file(src_path, dest_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace Navbar with B2BNavbar
    content = content.replace('import { Navbar } from "@/components/Navbar";', 'import B2BNavbar from "@/components/B2BNavbar";')
    content = content.replace("import { Navbar } from '@/components/Navbar';", "import B2BNavbar from '@/components/B2BNavbar';")
    content = content.replace('<Navbar />', '<B2BNavbar />')

    # Fix links
    content = content.replace('"/group-travel', '"/b2b/group-travel')
    content = content.replace("'/group-travel", "'/b2b/group-travel")
    content = content.replace('`/group-travel', '`/b2b/group-travel')

    # Save to dest
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx'):
            src_path = os.path.join(root, file)
            rel_path = os.path.relpath(src_path, src_dir)
            dest_path = os.path.join(dest_dir, rel_path)
            process_file(src_path, dest_path)
            print(f'Processed {rel_path}')
