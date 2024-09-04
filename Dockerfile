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


RUN mkdir -p results \
    && wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
COPY .nvmrc .
RUN nvm install && npm i -g yarn

COPY . .

RUN yarn && yarn build
#VOLUME /app/results

WORKDIR /app/server
RUN yarn

CMD ["/bin/bash", "--login", "-c", "yarn start"]