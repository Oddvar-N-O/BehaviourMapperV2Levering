from setuptools import setup, find_packages

setup(
    name='behaviourmapper_backend',
    version='1.0.1',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'flask',
    ],
)