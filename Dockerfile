FROM continuumio/miniconda3
SHELL ["/bin/bash", "--login", "-c"]

WORKDIR /app

# Create the environment:
COPY environment.yml .
RUN conda env create -f environment.yml

RUN conda init bash

# Activate the environment, and make sure it's activated:
# RUN conda init && conda activate image_registration_legacy

RUN conda activate image_registration_legacy

RUN echo "conda init && conda activate image_registration_legacy" >> ~/.bashrc
SHELL ["/bin/bash", "--login", "-c"]

RUN python -c "import SimpleITK"
RUN python -c "import cv2"
RUN python -c "import mat"
RUN python -c "import pandas"
RUN python -c "import PIL"


ENTRYPOINT ["python", "run.py"]