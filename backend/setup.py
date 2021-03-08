from setuptools import setup, find_packages

setup(
    name='behaviourmapper_backend',
    version='0.0.3.19',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'flask',
        'flask-cors',
        'protobuf',
        'python_dotenv',
        'Werkzeug',
        'flask-oidc',
        'pycryptodome',
    ],
)