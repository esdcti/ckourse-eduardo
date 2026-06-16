#!/usr/bin/env python3
"""
Ckourse - Download de Cursos do Google Drive via rclone

Uso:
  python download-drive.py

O script:
1. Verifica se rclone está instalado
2. Verifica se há um remote do Google Drive configurado (senão, configura)
3. Lista as pastas/arquivos na pasta "Cursos" do Drive
4. Permite escolher o que baixar
5. Baixa pro destino local
6. Extrai ZIPs automaticamente
"""

import subprocess
import sys
import os
import zipfile
import shutil
from pathlib import Path


# ============================================================
# Configuração
# ============================================================

DRIVE_FOLDER = "Cursos"  # Nome da pasta no Google Drive
DEFAULT_LOCAL = r"C:\Cursos"  # Pasta local padrão para downloads
REMOTE_NAME = "gdrive"  # Nome do remote no rclone


# ============================================================
# Funções auxiliares
# ============================================================

def run(cmd, capture=True):
    """Executa comando e retorna output."""
    result = subprocess.run(cmd, capture_output=capture, text=True, encoding="utf-8")
    return result


def check_rclone():
    """Verifica se rclone está instalado."""
    result = run(["rclone", "version"])
    if result.returncode != 0:
        print("❌ rclone não encontrado!")
        print("   Instale com: winget install rclone")
        print("   Ou baixe em: https://rclone.org/downloads/")
        sys.exit(1)
    version = result.stdout.strip().split("\n")[0]
    print(f"✅ {version}")


def check_remote():
    """Verifica se o remote do Drive está configurado."""
    result = run(["rclone", "listremotes"])
    if result.returncode != 0:
        return False
    remotes = [r.strip().rstrip(":") for r in result.stdout.strip().split("\n") if r.strip()]
    return REMOTE_NAME in remotes


def configure_remote():
    """Configura o remote do Google Drive interativamente."""
    print(f"\n🔧 Configurando remote '{REMOTE_NAME}' para Google Drive...")
    print("   Isso vai abrir o navegador para autorizar o acesso.\n")

    # Cria remote com tipo drive
    subprocess.run([
        "rclone", "config", "create", REMOTE_NAME, "drive",
        "--drive-scope", "drive.readonly",
    ])

    # Verifica se funcionou
    if not check_remote():
        print("❌ Falha ao configurar. Tente manualmente: rclone config")
        sys.exit(1)

    print("✅ Google Drive configurado com sucesso!")


def list_drive_contents(path=""):
    """Lista conteúdo de uma pasta no Drive."""
    remote_path = f"{REMOTE_NAME}:{DRIVE_FOLDER}"
    if path:
        remote_path += f"/{path}"

    result = run(["rclone", "lsf", remote_path, "--dirs-only"])
    dirs = [d.rstrip("/") for d in result.stdout.strip().split("\n") if d.strip()] if result.returncode == 0 else []

    result = run(["rclone", "lsf", remote_path, "--files-only"])
    files = [f for f in result.stdout.strip().split("\n") if f.strip()] if result.returncode == 0 else []

    return dirs, files


def download_item(remote_path, local_path):
    """Baixa um item (pasta ou arquivo) do Drive."""
    source = f"{REMOTE_NAME}:{DRIVE_FOLDER}/{remote_path}"
    print(f"\n⬇️  Baixando: {remote_path}")
    print(f"   Destino: {local_path}\n")

    os.makedirs(local_path, exist_ok=True)

    result = subprocess.run(
        ["rclone", "copy", source, local_path, "--progress", "--transfers", "4"],
    )

    if result.returncode == 0:
        print(f"\n✅ Download concluído!")
        return True
    else:
        print(f"\n❌ Erro no download.")
        return False


def extract_zips(folder):
    """Extrai todos os ZIPs encontrados na pasta."""
    extracted = []
    for file in Path(folder).glob("*.zip"):
        print(f"📦 Extraindo: {file.name}...")
        extract_dir = file.parent / file.stem
        try:
            with zipfile.ZipFile(file, "r") as zf:
                zf.extractall(extract_dir)
            extracted.append(extract_dir)
            # Remove o ZIP após extrair
            file.unlink()
            print(f"   ✅ Extraído para: {extract_dir}")
        except Exception as e:
            print(f"   ❌ Erro ao extrair: {e}")

    return extracted


def get_local_path():
    """Pergunta ao usuário o caminho local para download."""
    print(f"\n📂 Pasta local para download (Enter para padrão: {DEFAULT_LOCAL}):")
    local = input("   > ").strip()
    if not local:
        local = DEFAULT_LOCAL
    os.makedirs(local, exist_ok=True)
    return local


# ============================================================
# Menu principal
# ============================================================

def main():
    print("=" * 60)
    print("  🎓 Ckourse - Download de Cursos do Google Drive")
    print("=" * 60)
    print()

    # 1. Verificar rclone
    check_rclone()

    # 2. Verificar/configurar remote
    if not check_remote():
        print(f"\n⚠️  Remote '{REMOTE_NAME}' não encontrado.")
        configure_remote()
    else:
        print(f"✅ Remote '{REMOTE_NAME}' configurado")

    # 3. Listar conteúdo da pasta Cursos
    print(f"\n📋 Listando conteúdo de '{DRIVE_FOLDER}' no Drive...\n")
    dirs, files = list_drive_contents()

    if not dirs and not files:
        print(f"   ⚠️  Pasta '{DRIVE_FOLDER}' vazia ou não encontrada no Drive.")
        print(f"   Verifique se a pasta existe no seu Google Drive.")
        sys.exit(1)

    items = []
    idx = 1

    if dirs:
        print("   📁 Pastas:")
        for d in sorted(dirs):
            print(f"      {idx}. {d}/")
            items.append(("dir", d))
            idx += 1

    if files:
        print("   📄 Arquivos:")
        for f in sorted(files):
            print(f"      {idx}. {f}")
            items.append(("file", f))
            idx += 1

    print(f"\n      0. Baixar TUDO")
    print()

    # 4. Escolher o que baixar
    choice = input("   Escolha (número ou 0 para tudo): ").strip()

    if choice == "0":
        selected = items
    else:
        try:
            selected_idx = int(choice) - 1
            if 0 <= selected_idx < len(items):
                selected = [items[selected_idx]]
            else:
                print("❌ Opção inválida.")
                sys.exit(1)
        except ValueError:
            print("❌ Opção inválida.")
            sys.exit(1)

    # 5. Caminho local
    local_path = get_local_path()

    # 6. Baixar
    for item_type, item_name in selected:
        dest = os.path.join(local_path, item_name) if item_type == "dir" else local_path
        success = download_item(item_name, dest)
        if not success:
            continue

    # 7. Extrair ZIPs
    print("\n🔍 Verificando ZIPs para extrair...")
    extracted = extract_zips(local_path)

    # Também verificar subpastas
    for d in Path(local_path).iterdir():
        if d.is_dir():
            extracted += extract_zips(str(d))

    # 8. Resumo
    print("\n" + "=" * 60)
    print("  ✅ CONCLUÍDO!")
    print("=" * 60)
    print(f"\n  📂 Arquivos em: {local_path}")
    if extracted:
        print(f"  📦 ZIPs extraídos: {len(extracted)}")
    print(f"\n  💡 Agora abra o Ckourse e importe a pasta '{local_path}'")
    print(f"     ou uma subpasta específica do curso.")
    print()
    input("  Pressione Enter para fechar...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n   Cancelado pelo usuário.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        input("\n   Pressione Enter para fechar...")
        sys.exit(1)
